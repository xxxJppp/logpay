import Cookies from 'js-cookie'

const TokenKey = 'LogPay'

export function getKey() {
  return Cookies.get(TokenKey)
}

export function setKey(token) {
  return Cookies.set(TokenKey, token)
}

export function removeKey() {
  return Cookies.remove(TokenKey)
}
