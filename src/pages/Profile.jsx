// src/pages/Profile.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import { getLatLongFromAddress } from "../utils/Geo"; 

import {
  getSavedAddresses,
  saveAddressForUser,
  updateSavedAddress,
  deleteSavedAddress
} from "../utils/AdressDB";

import './Profile.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(AuthContext);
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [activeTab, setActiveTab] = useState("settings");
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    address1: "",
    address2: "",
    city: "",
    pincode: "",
    country: ""
  });

  const [editingId, setEditingId] = useState(null);
  const updateName = async () => {
    if (!newName.trim()) return alert("Enter a name");

    const { error } = await Supabase
      .from("users")
      .update({ name: newName })
      .eq("user_id", user.id);

    if (error) return alert("Error updating name");

    alert("Name updated!");
    setNewName("");
  };

  const updatePassword = async () => {
    if (!newPassword.trim()) return alert("Enter a new password");

    const { error } = await Supabase.auth.updateUser({
      password: newPassword
    });

    if (error) return alert(error.message);

    alert("Password updated!");
    setCurrentPassword("");
    setNewPassword("");
  };

  // Load saved addresses
  const loadAddresses = async () => {
    if (!user) return;
    const data = await getSavedAddresses(user.id);
    setAddresses(data);
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
  e.preventDefault();
  if (!user) return;

  // ---------------------------------
  // 1. Fetch coordinates first
  // ---------------------------------
  const coords = await getLatLongFromAddress(
    form.address1,
    form.address2,
    form.city,
    form.pincode,
    form.country
  );

  console.log("📍 Geocoded coords:", coords);

  // ---------------------------------
  // 2. SAVE OR UPDATE WITH COORDINATES
  // ---------------------------------
  if (editingId) {
    // Updating an existing address
    await updateSavedAddress(editingId, {
      ...form,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null
    });

    setEditingId(null);

  } else {
    // Creating a new address
    await saveAddressForUser(
      user.id,
      form,
      coords ?? null        // pass null if geocode fails
    );
  }

  // ---------------------------------
  // 3. Reset form & reload
  // ---------------------------------
  setForm({
    address1: "",
    address2: "",
    city: "",
    pincode: "",
    country: ""
  });

  loadAddresses();
};


  const startEdit = (addr) => {
    setEditingId(addr.address_id);
    setForm({
      address1: addr.address1,
      address2: addr.address2 || "",
      city: addr.city,
      pincode: addr.pincode,
      country: addr.country
    });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await deleteSavedAddress(id);
    loadAddresses();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="profile-wrapper">

      {/* -------- SIDEBAR -------- */}
      <aside className="profile-sidebar">
        <h2 className="sidebar-title">Account</h2>

      <ul className="sidebar-links">
        <li><button onClick={() => setActiveTab("addresses")}>Addresses</button></li>
        <li><button onClick={() => setActiveTab("orders")}>Orders</button></li>
        <li><button onClick={() => navigate('/cart')}>Cart</button></li>

        
        <li><button onClick={() => setActiveTab("settings")}>Profile Settings</button></li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="profile-main">

        {user && !loading ? (
          <>
            <h1 className="welcome-text">Welcome, {user.name || user.email}</h1>
            {/* ========================== */}
            {/* PROFILE SETTINGS TAB       */}
            {/* ========================== */}
            {activeTab === "settings" && (
              <div className="settings-section">
                <h2 className="section-title">Edit Profile</h2>

                {/* --- NAME UPDATE --- */}
                <div className="settings-card">
                  <h3>Update Name</h3>
                  <input
                    type="text"
                    placeholder="Enter new name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <button onClick={updateName}>Save Name</button>
                </div>

                {/* --- PASSWORD UPDATE --- */}
                <div className="settings-card">
                  <h3>Change Password</h3>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button onClick={updatePassword}>Change Password</button>
                </div>
              </div>
            )}

            {/* ----- SAVED ADDRESSES ----- */}
            <h2 className="section-title">Your Saved Addresses</h2>

            {addresses.length === 0 && <p>No saved addresses yet.</p>}

            <div className="address-list">
              {addresses.map(addr => (
                <div key={addr.address_id} className="address-card">
                  <p>{addr.address1}</p>
                  {addr.address2 && <p>{addr.address2}</p>}
                  <p>{addr.city}, {addr.pincode}</p>
                  <p>{addr.country}</p>

                  {addr.lat && addr.lng && (
                    <p className="coords">📍 {addr.lat}, {addr.lng}</p>
                  )}

                  <div className="address-buttons">
                    <button onClick={() => startEdit(addr)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteAddress(addr.address_id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ----- ADD/EDIT FORM ----- */}
            <h2 className="section-title">{editingId ? "Edit Address" : "Add New Address"}</h2>

            <form className="address-form" onSubmit={handleSaveAddress}>
              <input name="address1" placeholder="Address Line 1" value={form.address1} onChange={handleChange} required />
              <input name="address2" placeholder="Address Line 2" value={form.address2} onChange={handleChange} />
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
              <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />

              <button type="submit">{editingId ? "Save Changes" : "Add Address"}</button>

              {editingId && (
                <button type="button" className="cancel-btn" onClick={() => {
                  setEditingId(null);
                  setForm({ address1: "", address2: "", city: "", pincode: "", country: "" });
                }}>
                  Cancel
                </button>
              )}
            </form>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;
