function ForgetPassword(){
    return(
    <>
<main className="auth-page">
    <div className="auth-wrap size-lg">
    <div className="auth-brand-row">
        <span className="icon icon-xl auth-logo" data-icon="kanbanSquare"></span>
        <div>
            <h1>Forgot password?</h1>
            <p className="page-subtitle">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>
    </div>

    <div className="card auth-card">

        <div className="auth-divider">
            <span></span>
            <p>reset your password</p>
            <span></span>
        </div>

        <form id="forgotPasswordForm" noValidate>

            <div className="field">
                <label className="field-label" htmlFor="forgotEmail">
                    Email
                </label>

                <input
                    className="input"
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    placeholder="you@teamflow.dev"
                    autoComplete="email"
                    required
                />

                <p
                    className="field-error hidden"
                    data-error-for="forgotEmail"
                ></p>
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-full"
            >
                Send reset link
            </button>

        </form>
    </div>

    <p className="auth-footer-text">
        Remember your password?{" "}
        <a href="login.html" className="auth-inline-link">
            Log in
        </a>
    </p>

</div>

</main>



    </>
    )
}
export default ForgetPassword;