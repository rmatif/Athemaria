export function formatDate(dateInput: string | number | Date): string {
  let date: Date;

  if (typeof dateInput === 'string') {
    // Check if the string is purely numeric (potential timestamp)
    if (/^\d+$/.test(dateInput)) {
      const numericTimestamp = parseInt(dateInput, 10);
      date = new Date(numericTimestamp);
    } else {
      // Fallback to direct parsing for ISO strings or other date formats
      date = new Date(dateInput);
    }
  } else {
    // Handles number (timestamp) or Date object directly
    date = new Date(dateInput);
  }

  // Check if the date is valid after parsing
  if (isNaN(date.getTime())) {
    console.error("Failed to parse date:", dateInput); // Log error for debugging
    // Return a placeholder, or the original input if it helps identify the source
    return `Invalid Date: ${dateInput}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(" ")
}

