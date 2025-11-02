import React, { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

import Supabase from '../../utils/Database';

const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Customer',
    name: '',
    latitude: '',
    longitude: ''
  });

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Step '+step+' completed:', formData);
    setStep(step + 1);
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  const handleFormDataChange = (data: { [key: string]: string }) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    const {data, error} = await Supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options:{data:{
        role: formData.role.toLowerCase(),
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude
      }}
    });
    if(!error)
    {
      setStep(step+1);
      const {data, error} = await Supabase.auth.signInWithOtp({email: formData.email,
        options:{emailRedirectTo: 'https://localhost:5173'}});
      console.log('User created');
    }
  }
  return (
    <div>
      {step === 1 && <Step1 onNext={(e)=>{handleNextStep(e)}} onChange={handleFormDataChange} initialFormData={formData}/>}
      {step === 2 && <Step2 onNext={(e)=>{handleSubmit(e)}} onPrev={handlePreviousStep} onChange={handleFormDataChange} />}
      {step === 3 && <Step3/>}
    </div>
  );
};

export default RegistrationFlow;