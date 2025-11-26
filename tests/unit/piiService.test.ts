import piiService from '../../src/services/piiService';

describe('PiiService', () => {
  describe('anonymize', () => {
    it('should anonymize email addresses', () => {
      const text = 'Contact me at test@example.com or another.email@domain.co.uk.';
      const expected = 'Contact me at [EMAIL] or [EMAIL].';
      expect(piiService.anonymize(text)).toBe(expected);
    });

    it('should anonymize phone numbers', () => {
      const text = 'My number is +46 70 123 45 67, or call 070-1234567.';
      const expected = 'My number is [PHONE], or call [PHONE].';
      expect(piiService.anonymize(text)).toBe(expected);
    });

    it('should anonymize Swedish SSN', () => {
      const text = 'My Swedish SSN is 19900101-1234.';
      const expected = 'My Swedish SSN is [SSN].';
      expect(piiService.anonymize(text)).toBe(expected);
    });
    
    it('should anonymize another Swedish SSN format', () => {
        const text = 'Another valid ssn is 900101+1234.';
        const expected = 'Another valid ssn is [SSN].';
        expect(piiService.anonymize(text)).toBe(expected);
    });

    it('should anonymize credit card numbers', () => {
      // This is a valid Luhn algorithm number
      const text = 'My card number is 4992-7398-716-1234.';
      const expected = 'My card number is [CARD].';
      const result = piiService.anonymize(text);
      expect(result).toBe(expected);
    });

    it('should not anonymize invalid credit card numbers', () => {
      const text = 'This is not a card number 1234-5678-1234-5670.';
      expect(piiService.anonymize(text)).toBe(text);
    });

    it('should handle a mix of PII', () => {
      const text = 'Email me at user@host.com, call +46701234567, SSN is 850101-1234 and card is 499273987161234.';
      const expected = 'Email me at [EMAIL], call [PHONE], SSN is [SSN] and card is [CARD].';
      expect(piiService.anonymize(text)).toBe(expected);
    });

    it('should not change text with no PII', () => {
      const text = 'This is a clean sentence with no personal information.';
      expect(piiService.anonymize(text)).toBe(text);
    });
  });
});
