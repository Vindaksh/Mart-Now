import React, { useState, ChangeEvent } from 'react';

interface Step2Props {
    onNext: (e:React.FormEvent<HTMLFormElement>) => void;
    onPrev: () => void;
    onChange: (data: {[key: string]:string}) => void;
}

const Step2: React.FC<Step2Props> = ({ onNext, onPrev, onChange }) => {
    const [formData, setFormData] = useState({
        role: "Customer",
        name: '',
        latitude: '',
        longitude: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    return (
        <form className="register-form step1" onSubmit={onNext}>
            <div className="form-group">
                <label htmlFor="role">Register as:</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e)=>handleSelect(e)}
                >
                    <option value="Customer">Customer</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Wholesaler">Wholesaler</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="name">{(formData.role!='Customer')?(formData.role+' name:'):'Name'}</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            {(formData.role!='Customer')&&
            <>
            <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input
                    id="latitude"
                    type="number"
                    step={0.000001}
                    name="latitude" 
                    value={formData.latitude}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="longitude">Longitude:</label>
                <input
                    id="longitude"
                    type="number"
                    step={0.000001}
                    name="longitude" 
                    value={formData.longitude}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            </>
            }
            <div className="navigation">
                <button onClick={onPrev} className="prev">Back</button>
                <button type="submit" className="next submit-btn">Submit</button>
            </div>
        </form>
    );
};

export default Step2;