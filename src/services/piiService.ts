import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

class PiiService {
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
    const emailRegex = /(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
    return text.replace(emailRegex, '[EMAIL]');
  }

  private anonymizePhone(text: string): string {
    // This is a simplified example. A real implementation would need to handle country codes better.
    // We'll iterate through possible regions. For this example, we focus on Nordic countries.
    const regions = ['SE', 'NO', 'DK', 'FI', 'US', 'GB'];
    let anonymizedText = text;
    try {
        for (const region of regions) {
            const numbers = this.phoneUtil.findNumbers(anonymizedText, region);
            for (const number of numbers) {
                const formattedNumber = this.phoneUtil.format(number.number, PhoneNumberFormat.E164);
                anonymizedText = anonymizedText.replace(number.rawString, '[PHONE]');
            }
        }
    } catch (error) {
        // Silently fail to avoid crashing on invalid numbers
    }


    return anonymizedText;
  }

  private anonymizeSsn(text: string): string {
    // Regex for Swedish, Norwegian, Danish, and Finnish SSNs
    const ssnRegex = /\b(\d{6,8}[-+]?\d{4})\b/g;
    return text.replace(ssnRegex, '[SSN]');
  }

  private luhnCheck(num: string): boolean {
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
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