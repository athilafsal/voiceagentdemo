import { Persona, PersonaCustomization } from './types';

const CANADIANISMS = {
  greeting: "Hello there",
  polite: "please",
  thankYou: "thanks so much",
  confirmation: "sounds good",
  timeZone: "Eastern Time",
  city: "Toronto",
  province: "Ontario",
  addressFormat: "Street, City, ON Postal Code",
  dateFormat: "day-month-year format (e.g., 15 January 2024)",
};

export function buildCanadianPrompt(
  persona: Persona,
  customization: PersonaCustomization
): string {
  const companyName = customization.companyName || persona.displayName;
  const service = customization.service || persona.description;
  const address = customization.address || `downtown ${CANADIANISMS.city}`;
  const phoneNumber = customization.phoneNumber || "";

  // Replace company name references in the base prompt
  let basePrompt = persona.systemPrompt
    .replace(new RegExp(persona.displayName, 'g'), companyName)
    .replace(/Modern Barber|Family Dental|Elite Plumbing/g, companyName);

  // Add Canadian-specific instructions
  const canadianInstructions = `
IMPORTANT - Use Canadian English and Toronto-specific details:
- Always use polite, friendly Canadian tone - say "please", "thanks so much", "sounds good", "no worries"
- Reference ${CANADIANISMS.city}, ${CANADIANISMS.province} when relevant (e.g., "here in Toronto", "in the GTA")
- Use Eastern Time (ET) for all time references - say "Eastern Time" or "ET" when mentioning times
- Use Canadian date format: day-month-year (e.g., "15 January 2024" not "January 15th, 2024")
- For addresses, use Canadian format: Street Name, ${CANADIANISMS.city}, ON Postal Code (e.g., "123 Queen Street West, Toronto, ON M5H 2M9")
- Be extra polite and accommodating - this is how we do business in ${CANADIANISMS.city}
- Use friendly phrases like "That works great!", "Perfect, thanks!", "No worries at all", "Absolutely!", "Sounds perfect!"
- When confirming times, say things like "That's perfect for us" or "We can absolutely do that" or "That works great for us"
- Use "eh" sparingly and naturally - Canadians don't overuse it, but it's part of our friendly tone
- Say "sorry" when appropriate (Canadian politeness!)
${phoneNumber ? `- Our phone number is ${phoneNumber} if customers need to call back` : ''}
${address ? `- We're located at ${address} in ${CANADIANISMS.city}, ${CANADIANISMS.province}` : ''}

CRITICAL - TOOL USAGE:
- You have access to a tool called 'confirm_booking'.
- Once you have the customer's name, appointment time, and shop name, you MUST call this tool.
- DO NOT say "I have booked the appointment" until you have successfully called the 'confirm_booking' tool.
- Call the tool silently; do not tell the user "I am calling the tool". Just call it.
- After the tool runs, confirm the success to the user.

Service Details:
- Main service: ${service}
- Company: ${companyName}
- Location: ${address}
`;

  return `${basePrompt}\n\n${canadianInstructions}`;
}

