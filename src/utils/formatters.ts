import { StatutPaiement } from '../types';

export function formatCurrency(amount: number, currency: string = 'F CFA'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `0 ${currency}`;
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} ${currency}`;
}

export const formatFCFA = (amount: number): string => formatCurrency(amount, 'F CFA');

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStatutPaiement(total: number, paye: number): StatutPaiement {
  if (paye >= total && total > 0) return 'Soldé';
  if (paye > 0) return 'Partiel';
  return 'Impayé';
}

export function cleanPhoneForWhatsApp(phone: string): string {
  // Strip spaces, dashes, parentheses and leading '+'
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Convert numbers to French words for receipts
export function numberToFrenchWords(n: number): string {
  if (n === 0) return "zéro Franc CFA";
  
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
  
  function convertUnderThousand(num: number): string {
    let res = "";
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    
    if (hundreds > 0) {
      if (hundreds === 1) {
        res += "cent ";
      } else {
        res += units[hundreds] + " cents ";
      }
    }
    
    if (remainder > 0) {
      if (remainder < 10) {
        res += units[remainder] + " ";
      } else if (remainder < 20) {
        res += teens[remainder - 10] + " ";
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;
        if (t === 7) {
          res += "soixante-" + teens[u] + " ";
        } else if (t === 9) {
          res += "quatre-vingt-" + teens[u] + " ";
        } else {
          res += tens[t];
          if (u === 1 && t !== 8) {
            res += "-et-un ";
          } else if (u > 0) {
            res += "-" + units[u] + " ";
          } else {
            res += " ";
          }
        }
      }
    }
    
    return res.trim();
  }

  let words = "";
  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const rest = n % 1000;

  if (millions > 0) {
    words += (millions === 1 ? "un million " : convertUnderThousand(millions) + " millions ");
  }

  if (thousands > 0) {
    if (thousands === 1) {
      words += "mille ";
    } else {
      words += convertUnderThousand(thousands) + " mille ";
    }
  }

  if (rest > 0) {
    words += convertUnderThousand(rest);
  }

  return (words.trim() + " Francs CFA").toUpperCase();
}
