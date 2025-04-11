import type { Review } from "../types"

/**
 * Calculates the average rating from an array of reviews
 * @param reviews Array of review objects
 * @returns Average rating as a number, or 0 if no reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) {
    return 0
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  return totalRating / reviews.length
}

/**
 * Gets the top-rated review from an array of reviews
 * @param reviews Array of review objects
 * @returns The review with the highest rating, or null if no reviews
 */
export function getTopRatedReview(reviews: Review[]): Review | null {
  if (!reviews || reviews.length === 0) {
    return null
  }

  // Sort reviews by rating (highest first)
  return [...reviews].sort((a, b) => b.rating - a.rating)[0]
}

/**
 * Formats a rating number to a fixed decimal string
 * @param rating Rating number
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export function formatRating(rating: number | undefined, decimals = 1): string {
  if (rating === undefined || rating === null) {
    return "0.0"
  }
  return rating.toFixed(decimals)
}
