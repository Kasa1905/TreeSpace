export interface AuthTokenProvider {
  getToken(interactive: boolean): Promise<string>;
  invalidateToken(token: string): Promise<void>;
}

export class ChromeIdentityAuth implements AuthTokenProvider {
  async getToken(interactive: boolean): Promise<string> {
    const result = await chrome.identity.getAuthToken({ interactive });
    if (!result.token) {
      throw new Error("Google authentication did not return an access token.");
    }
    return result.token;
  }

  async invalidateToken(token: string): Promise<void> {
    await chrome.identity.removeCachedAuthToken({ token });
  }
}
