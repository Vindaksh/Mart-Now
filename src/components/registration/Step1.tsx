import React, { useState, ChangeEvent, MouseEventHandler } from 'react';

interface Step1Props {
    onNext: (e:React.FormEvent<HTMLFormElement>) => void;
    onChange: (data: {[key: string]:string}) => void;
    initialFormData: {email: string, password: string};
}

const Step1: React.FC<Step1Props> = ({ onNext, onChange , initialFormData}) => {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    return (
        <form className="register-form step1" onSubmit={onNext}>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e)=>handleChange(e)}
                    required
                    minLength={6}
                />
            </div>
            <div className="navigation">
                <button type="submit" className="next">Get Started</button>
            </div>
        </form>
    );
};

export default Step1;