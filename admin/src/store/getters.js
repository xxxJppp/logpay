const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  key: state => state.user.key,
  email: state => state.user.email,
  id: state => state.user.id,
  uid: state => state.user.uid,
  meal: state => state.user.meal,
  token: state => state.user.token,
  mealtime: state => state.user.mealtime,
  money: state => state.user.money
}
export default getters
