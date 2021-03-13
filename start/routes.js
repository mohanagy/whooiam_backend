'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')

Route.get('/countries', 'CountryController.getAllCountries')
Route.get('/emojis/stickers', 'EmojiController.stickers')
Route.get('/emojis/reactions', 'EmojiController.reactions')

Route.get('/login/facebook', 'AuthController.loginFacebook')
Route.post('/login/facebook-callback', 'AuthController.facebookCallback')

Route.get('/login/twitter', 'AuthController.loginTwitter')
Route.get('/login/twitter-callback', 'AuthController.twitterCallback')

Route.post('/login/twitter', 'AuthController.loginTwitter')
Route.post('/register', 'AuthController.register').validator('User/UserRegisteration')
Route.post('/login', 'AuthController.login').validator('User/UserLogin')
Route.post('/forgot-password', 'AuthController.forgotPassword').validator('User/UserForgotPassword')
Route.put('/reset-password', 'AuthController.resetPassword').validator('User/UserResetPassword')
Route.post('/activate', 'AuthController.activateEmail')
Route.post('/check-user-exists', 'UserController.checkUserExists')

Route.post('/connectors/auth', 'ConnectorController.connectAuth')
Route.post('/connectors/anonymous', 'ConnectorController.connectAnonymous')

Route.post('/connectors/set-offline', 'ConnectorController.setOffline')

Route.post('/connectors/sender-info', 'ConnectorController.getSender')
Route.post('/connectors/find-receiver', 'ConnectorController.findReceiver')
Route.post('/connectors/get-sender-receiver-info', 'ConnectorController.getDirectSenderReceiver')

Route.post('/connectors/init-anonymous-chat', 'ConnectorController.initAnonymousChat')
Route.post('/connectors/init-direct-chat', 'ConnectorController.initDirectChat')
Route.post('/connectors/init-group-chat', 'ConnectorController.initGroupChat')
Route.post('/connectors/renew-conversation', 'ConnectorController.newConversation')
Route.post('/connectors/anonymous/messages', 'ConnectorController.getAnonymousMessages')
Route.post('/connectors/group/messages', 'ConnectorController.getGroupMessages')
Route.post('/connectors/direct/messages', 'ConnectorController.getDirectMessages')

Route.get('/pages/about', 'PageController.about')
Route.get('/pages/privacy-policy', 'PageController.privacyPolicy')
Route.get('/pages/terms-of-use', 'PageController.termsOfUse')
Route.get('/faqs', 'FaqController.index')
Route.post('/contact-us', 'ContactController.contactUs').validator('Contact/ContactMessage')

Route.post('/profile/info', 'UserController.getInfo')

Route.group(() => {
  Route.put('/edit', 'UserController.updateProfile').validator('User/UserEditProfile')
  Route.put('/privacy', 'UserController.updatePrivacy').validator('User/UserUpdatePrivacy')
  Route.put('/password', 'UserController.changePassword')
  Route.post('/uuid', 'UserController.changeUuid')
  Route.get('/uuid', 'UserController.generateUuid')
  Route.get('/me', 'UserController.me')
  Route.get('/edit', 'UserController.edit')
  Route.post('/upload-image', 'UserController.uploadImage')
  Route.get('/messages', 'UserController.getMessages')
}).prefix('account').middleware(['auth:jwt'])
