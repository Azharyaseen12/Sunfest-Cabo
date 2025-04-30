export const onGoogleLoginSuccess = () => {
	const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
	const REDIRECT_URI = 'api/social/login/google/'

	const scope = [
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile',
	].join(' ')

	const params = {
		response_type: 'code',
		client_id: import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID,
		redirect_uri: `${import.meta.env.VITE_API_URL}${REDIRECT_URI}`,
		prompt: 'select_account',
		access_type: 'offline',
		scope,
	}

	console.log(params)

	const urlParams = new URLSearchParams(params).toString()
	window.location = `${GOOGLE_AUTH_URL}?${urlParams}`
}

export const onFacebookLoginSuccess = () => {
	const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v12.0/dialog/oauth'
	const REDIRECT_URI_FACEBOOK = 'api/social/login/facebook/'

	const scope = ['email', 'public_profile'].join(',')

	const params = {
		response_type: 'code',
		client_id: import.meta.env.VITE_FACEBOOK_APP_ID || '9966805863378023',
		redirect_uri: `${import.meta.env.VITE_API_URL}${REDIRECT_URI_FACEBOOK}`,
		scope,
	}

	console.log(params)

	const urlParams = new URLSearchParams(params).toString()
	window.location = `${FACEBOOK_AUTH_URL}?${urlParams}`
}
