import { NewsletterWelcomeEmail } from "@/components/emails/newsletter-welcome-email"
import { OTPEmail } from "@/components/emails/otp-email"
import React from "react"
import { Resend } from "resend"
import config from "./config"

export const resend = config.email.apiKey && config.email.apiKey !== "please-set-your-resend-api-key-here"
  ? new Resend(config.email.apiKey)
  : null

export async function sendOTPCodeEmail({ email, otp }: { email: string; otp: string }) {
  if (!resend) {
    console.log(`[DEV] OTP code for ${email}: ${otp}`)
    return
  }

  const html = React.createElement(OTPEmail, { otp })

  return await resend.emails.send({
    from: config.email.from,
    to: email,
    subject: `Your ${config.app.title} verification code`,
    react: html,
  })
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!resend) {
    console.log(`[DEV] Newsletter welcome email for ${email}`)
    return
  }

  const html = React.createElement(NewsletterWelcomeEmail)

  return await resend.emails.send({
    from: config.email.from,
    to: email,
    subject: `Welcome to ${config.app.title}!`,
    react: html,
  })
}
