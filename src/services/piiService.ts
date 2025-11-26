import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';

export class PiiService {
  private phoneUtil: PhoneNumberUtil;

  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  public anonymize(text: string): string {
    let anonymizedText = text;

    anonymizedText = this.anonymizeEmail(anonymizedText);
    anonymizedText = this.anonymizePhone(anonymizedText);
    anonymizedText = this.anonymizeSsn(anonymizedText);
    anonymizedText = this.anonymizeCreditCard(anonymizedText);

    return anonymizedText;
  }

  private anonymizeEmail(text: string): string {
    // A robust regex for email addresses
    const emailRegex = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
    return text.replace(emailRegex, '[EMAIL]');
  }

  private anonymizePhone(text: string): string {
    const phoneRegex = /(?:\+?\d{1,3}[ -]?)?\(?\d{2,3}\)?[ -]?\d{3,4}[ -]?\d{4}/g;
    let anonymizedText = text;
    const matches = text.match(phoneRegex);

    if (matches) {
      for (const match of matches) {
        try {
          // Use a default region (e.g., 'US') for parsing, as it's good at handling international formats
          const phoneNumber = this.phoneUtil.parseAndKeepRawInput(match, 'US');
          if (this.phoneUtil.isValidNumber(phoneNumber)) {
            anonymizedText = anonymizedText.replace(match, '[PHONE]');
          }
        } catch (error) {
          // Ignore if parsing fails, it's likely not a valid phone number
        }
      }
    }
    return anonymizedText;
  }

  private anonymizeSsn(text: string): string {
    // Regex for Swedish, Norwegian, Danish, and Finnish SSNs
    const ssnRegex = /\b(\d{6,8}[-+]?\d{4})\b/g;
    return text.replace(ssnRegex, '[SSN]');
  }

  private luhnCheck(num: string): boolean {
    if (!num || num.length < 13) {
      return false;
    }
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x, 10));
    const lastDigit = arr.splice(0, 1)[0];

    if (lastDigit === undefined) {
      return false;
    }

    let sum = arr.reduce(
      (acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9),
      0
    );
    sum += lastDigit;
    return sum % 10 === 0;
  }

  private anonymizeCreditCard(text: string): string {
    const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
    return text.replace(creditCardRegex, (match) => {
        const digitsOnly = match.replace(/\D/g, '');
        if (this.luhnCheck(digitsOnly)) {
            return '[CARD]';
        }
        return match;
    });
  }
}

export default new PiiService();