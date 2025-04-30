import { useState } from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'
import { Button } from '@mui/material'

const AuthButton = () => {
	const [showSignIn, setShowSignIn] = useState(false)
	const [showSignUp, setShowSignUp] = useState(false)

	const handleSignInClick = () => {
		setShowSignIn(true)
		setShowSignUp(false)
	}

	const handleSignUpClick = () => {
		setShowSignUp(true)
		setShowSignIn(false)
	}

	return (
		<>
			<Button onClick={handleSignInClick} variant="contained" color="primary">
				Sign In
			</Button>

			{showSignIn && (
				<SignIn
					onClose={() => setShowSignIn(false)}
					onSignUpClick={handleSignUpClick}
				/>
			)}

			{showSignUp && (
				<SignUp
					onClose={() => setShowSignUp(false)}
					onSignInClick={handleSignInClick}
				/>
			)}
		</>
	)
}

export default AuthButton
