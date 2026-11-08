import React from 'react';

/**
 * Authentic Publisher Image Validator
 * Returns strictly the genuine image URL provided directly by the news publisher for that article.
 * Never substitutes unrelated keyword-guessed photos.
 */

export function getArticleImage(
  imageUrl?: string | null,
  _title?: string,
  _category?: string
): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (
    trimmed !== '' &&
    !trimmed.includes('tse2.mm.bing.net') &&
    (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:'))
  ) {
    return trimmed;
  }
  return null;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  target.style.display = 'none';
  const parent = target.parentElement;
  if (parent) {
    parent.style.display = 'none';
  }
}
