interface Step3Props {};

const Step3: React.FC<Step3Props> = () => {
    return (
        <form className="register-form step3">
            <h2 className="text">Verification Sent!</h2>
            <p className="text">Please continue from the link in your mail</p>
        </form>
    );
}

export default Step3;