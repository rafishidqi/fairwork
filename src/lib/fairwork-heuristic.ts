import { Submission } from '@/types/database';

/**
 * FR-8: Heuristic flag for unedited / suspected bulk text (Appendix A)
 * Evaluates whether a submission should display a neutral 'Needs careful review' badge.
 * Does NOT reject or block; solely provides a prompt for peer reviewers.
 */
export function evaluateTextFlag(
  newText: string,
  previousSubmissions: Submission[] = []
): { flag: boolean; reason: string | null } {
  const trimmed = newText.trim();

  // Rule A2: Text unchanged after reviewer requested revision
  if (previousSubmissions.length > 0) {
    const lastSub = previousSubmissions[previousSubmissions.length - 1];
    if (
      trimmed.length > 20 &&
      trimmed.toLowerCase() === lastSub.deskripsi.trim().toLowerCase()
    ) {
      return {
        flag: true,
        reason: 'Text is identical to the previous revision draft. Verify whether requested feedback was incorporated.',
      };
    }
  }

  // Rule A1: Extensive text appears in a single draft without prior iterations (>600 characters)
  if (previousSubmissions.length === 0 && trimmed.length > 600) {
    return {
      flag: true,
      reason: 'Large initial text block submitted without incremental drafts. Thorough review suggested.',
    };
  }

  return { flag: false, reason: null };
}
