import Cookies from 'js-cookie'

const TokenKey = '16201030240'

export function getKey() {
  return Cookies.get(TokenKey)
}

export function setKey(token) {
  return Cookies.set(TokenKey, token)
}

export function removeKey() {
  return Cookies.remove(TokenKey)
}
