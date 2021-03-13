'use strict'

const Event = use("Event")

Event.on('user::activate-email', 'User.activateEmail')
Event.on('user::forgot-password', 'User.forgotPassword')