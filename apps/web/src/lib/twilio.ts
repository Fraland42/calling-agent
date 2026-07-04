import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export const twilioClient = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export function isTwilioConfigured() {
  return !!twilioClient && !!process.env.TWILIO_PHONE_NUMBER;
}
