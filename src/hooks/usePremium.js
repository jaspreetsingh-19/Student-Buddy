export function usePremium(user) {
    if (!user) return false;
    return user.isPremium && new Date(user.premiumExpiresAt) > new Date();
}
