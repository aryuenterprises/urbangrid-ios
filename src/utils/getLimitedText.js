export const getLimitedText = (html, maxLength = 120) => {
    if (!html) return '';

    // First decode HTML entities
    const decodedText = html
        .replace(/&nbsp;/g, ' ')                 // Replace non-breaking spaces
        .replace(/&amp;/g, '&')                  // Replace ampersands
        .replace(/&lt;/g, '<')                   // Replace less than
        .replace(/&gt;/g, '>')                   // Replace greater than
        .replace(/&quot;/g, '"')                 // Replace quotes
        .replace(/&#39;/g, "'");                 // Replace apostrophes

    // Then process HTML tags
    const plainText = decodedText
        .replace(/<h[1-6]>/gi, '')               // Remove heading tags (case insensitive)
        .replace(/<\/h[1-6]>/gi, ': ')           // Convert heading endings to colon
        .replace(/<li>/gi, '• ')                 // Convert list items to bullet points
        .replace(/<br\s*\/?>/gi, '\n')           // Convert line breaks to newlines
        .replace(/<[^>]*>/g, '')                 // Remove all other tags
        .replace(/\s+/g, ' ')                    // Collapse multiple spaces
        .replace(/\s+$/, '')                     // Remove trailing spaces
        .trim();

    return plainText.length > maxLength
        ? plainText.substring(0, maxLength) + '...'
        : plainText;
};