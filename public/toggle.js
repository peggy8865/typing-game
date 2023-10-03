const title = document.getElementById('post-title')
const body = document.getElementById('post-body')
const editBtn = document.getElementById('edit-button')
const editingPost = document.getElementById('post-editing')
const editingTitle = document.getElementById('title-editing')
const editingBody = document.getElementById('body-editing')
const cancelBtn = document.getElementById('cancel-button')

if (editBtn) {
  editBtn.addEventListener('click', () => {
    title.classList.toggle('hidden')
    body.classList.toggle('hidden')
    editingPost.classList.toggle('hidden')
    if (!editingPost.matches('.hidden')) {
      editingTitle.value = title.textContent
      editingBody.textContent = body.textContent
    }
  })
}

if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    title.classList.toggle('hidden')
    body.classList.toggle('hidden')
    editingPost.classList.toggle('hidden')
  })
}

const deleteReplyAlert = document.getElementById('deleteReplyAlert')
const deleteReplyForm = deleteReplyAlert.querySelector('.form')

if (deleteReplyAlert) {
  deleteReplyAlert.addEventListener('show.bs.modal', e => {
    const button = e.relatedTarget
    const replyId = button.getAttribute('data-bs-reply-id')
    const deleteUrl = deleteReplyForm.action
    deleteReplyForm.action = deleteUrl.replace(':id', replyId)
  })
}
