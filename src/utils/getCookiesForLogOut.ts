export function getCookiesForLogOut() {
  return [
    'Authentication=; HttpOnly; Path=/; Max-Age=0',
    'Refresh=; HttpOnly; Path=/; Max-Age=0',
  ];
}
