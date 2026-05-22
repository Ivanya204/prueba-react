import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Nav from '../components/Nav'
import PostForm from '../components/PostForm'
import ConfirmModal from '../components/ComfirmModal'

const Post = () => {
  const [post, setPost] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const navigate = useNavigate()
  const token = localStorage.getItem('fakestore_token') || sessionStorage.getItem('fakestore_token')

  const [showPostForm, setShowPostForm] = useState(false)
  const [postSubmitting, setPostSubmitting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postSuccess, setPostSuccess] = useState('')
  const [editingPost, setEditingPost] = useState(null)
  const [loadingPostDetail, setLoadingPostDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)

  const filteredPost = post.filter((p) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [p.title, p.body]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const totalPages = Math.max(1, Math.ceil(filteredPost.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPost = filteredPost.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    const fetchPost = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        if (!response.ok) {
          throw new Error('Error al cargar los post')
        }
        const data = await response.json()
        setPost(data.map((p) => ({ ...p, source: 'api' })))
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los post')
      } finally {
        setLoading(false)
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!response.ok) {
          throw new Error('Error al cargar los usuarios')
        }
        const data = await response.json()
        setUser(data)
      } catch (err) {
        console.warn(err)
      }
    }

    fetchUsers()
    fetchPost()
  }, [navigate, token])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleEditPost = async (postId) => {
    setPostError('')
    setLoadingPostDetail(true)

    const localPost = post.find((p) => p.id === postId)

    if (localPost) {
      setEditingPost(localPost)
      setShowPostForm(true)
      setLoadingPostDetail(false)
      return
    }

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
      if (!response.ok) {
        throw new Error('Error al cargar el post')
      }
      const data = await response.json()
      setEditingPost({ ...data, source: 'api' })
      setShowPostForm(true)
    } catch (err) {
      setPostError(err.message || 'No se pudo cargar el post')
    } finally {
      setLoadingPostDetail(false)
    }
  }

  const handleUpdatePost = async (formData) => {
    setPostError('')
    setPostSuccess('')
    setPostSubmitting(true)

    const isLocalPost = editingPost?.source !== 'api'

    try {
      if (isLocalPost) {
        setPost((prev) =>
          prev.map((p) =>
            p.id === editingPost.id ? { ...p, ...formData, source: p.source || 'local' } : p
          )
        )
        setPostSuccess('Post actualizado correctamente.')
        setShowPostForm(false)
        setEditingPost(null)
        return
      }

      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error actualizando post')
      }

      const data = await response.json()
      setPost((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...data, source: 'api' } : p))
      )
      setPostSuccess('Post actualizado correctamente.')
      setShowPostForm(false)
      setEditingPost(null)
    } catch (err) {
      setPostError(err.message || 'No se pudo actualizar el post')
    } finally {
      setPostSubmitting(false)
    }
  }

  const handleDeletePost = (postId) => {
    setPostToDelete(postId)
    setShowDeleteConfirm(true)
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return

    setPostError('')
    setPostSuccess('')
    setShowDeleteConfirm(false)

    try {
      const targetPost = post.find((p) => p.id === postToDelete)
      if (targetPost?.source !== 'api') {
        setPost((prev) => prev.filter((p) => p.id !== postToDelete))
        setPostSuccess('Post eliminado correctamente.')
        setPostToDelete(null)
        return
      }

      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error eliminando post')
      }

      setPost((prev) => prev.filter((p) => p.id !== postToDelete))
      setPostSuccess('Post eliminado correctamente.')
      setPostToDelete(null)
    } catch (err) {
      setPostError(err.message || 'No se pudo eliminar el post')
      setPostToDelete(null)
    }
  }

  const cancelDeletePost = () => {
    setShowDeleteConfirm(false)
    setPostToDelete(null)
  }

  const handleCreatePost = async (formData) => {
    setPostError('')
    setPostSuccess('')
    setPostSubmitting(true)

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Error creando post')
      }

      const data = await response.json()
      const newPost = { ...data, source: 'local' }
      setPost((prev) => [newPost, ...(prev || [])])
      setPostSuccess('Post creado correctamente. ID: ' + (newPost.id || '—'))
      setShowPostForm(false)
      setEditingPost(null)
      setCurrentPage(1)
    } catch (err) {
      setPostError(err.message || 'No se pudo crear el post')
    } finally {
      setPostSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {token && <Nav />}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold text-slate-900">Posts</h1>
            <button
              type="button"
              onClick={() => {
                setEditingPost(null)
                setShowPostForm((s) => !s)
              }}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Nuevo Post
            </button>
          </div>

          <div className="max-w-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por título o contenido"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {postError && (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">{postError}</div>
        )}
        {postSuccess && (
          <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{postSuccess}</div>
        )}

        {showPostForm && (
          <PostForm
            initialData={editingPost || {}}
            user={user}
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            submitting={postSubmitting || loadingPostDetail}
            onClose={() => {
              setShowPostForm(false)
              setEditingPost(null)
            }}
          />
        )}

        <ConfirmModal
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer."
          isOpen={showDeleteConfirm}
          isDangerous={true}
          onConfirm={confirmDeletePost}
          onCancel={cancelDeletePost}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">Cargando posts...</div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-6 text-rose-700">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentPost.map((p) => {
                const autor = user.find((u) => u.id === p.userId)
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col gap-3"
                  >
                    <div>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        #{p.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 capitalize">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 flex-1">{p.body}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        {autor ? autor.name : `Usuario ${p.userId}`}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPost(p.id)}
                          disabled={loadingPostDetail}
                          className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(p.id)}
                          className="rounded-xl bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between ring-1 ring-slate-200">
              <div className="text-sm text-slate-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Post
