const avatarImg = document.getElementById('preview-avatar')
const avatarInput = document.getElementById('avatar')

avatarImg.addEventListener('click', e => {
  e.preventDefault()
  avatarInput.click()
})

avatarInput.addEventListener('change', e => {
  avatarImg.src = URL.createObjectURL(e.target.files[0])
  avatarImg.onload = () => {
    URL.revokeObjectURL(avatarImg.src)
  }
})
