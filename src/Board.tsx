import { useEffect, useState, type FormEvent } from 'react'
import type { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'

type Post = Schema['Post']['type']
type Posts = ReturnType<typeof generateClient<Schema>>['models']['Post']

export function Board({ posts, canEdit, canDelete }: {
  posts: Posts
  canEdit: boolean
  canDelete: boolean
}) {
  const [items, setItems] = useState<Post[]>([])
  const [draft, setDraft] = useState<{ id?: string; title: string; body: string }>()
  const [version, setVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [listError, setListError] = useState(false)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setListError(false)
      try {
        const result: Post[] = []
        let nextToken: string | null | undefined
        do {
          const page = await posts.list({ limit: 100, nextToken })
          if (!active) return
          if (page.errors?.length) throw new Error('게시글 조회 실패')
          result.push(...page.data)
          nextToken = page.nextToken
        } while (nextToken)
        result.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        setItems(result)
      } catch {
        if (active) setListError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [posts, version])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || saving || !canEdit) return
    const title = draft.title.trim()
    const body = draft.body.trim()
    setMessage('')
    if (!title || !body) {
      setActionError('제목과 본문을 입력해 주세요.')
      return
    }
    setSaving(true)
    setActionError('')
    try {
      const result = draft.id
        ? await posts.update({ id: draft.id, title, body })
        : await posts.create({ title, body })
      if (result.errors?.length || !result.data) throw new Error('게시글 저장 실패')
      setDraft(undefined)
      setMessage('게시글을 저장했습니다.')
      setVersion((current) => current + 1)
    } catch {
      setActionError('게시글을 저장하지 못했습니다. 연결과 권한을 확인해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(post: Post) {
    if (saving || !canDelete || !window.confirm('이 게시글을 삭제할까요?')) return
    setSaving(true)
    setActionError('')
    setMessage('')
    try {
      const result = await posts.delete({ id: post.id })
      if (result.errors?.length) throw new Error('게시글 삭제 실패')
      if (draft?.id === post.id) setDraft(undefined)
      setMessage('게시글을 삭제했습니다.')
      setVersion((current) => current + 1)
    } catch {
      setActionError('게시글을 삭제하지 못했습니다. 연결과 권한을 확인해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-label="게시글 관리">
      <div className="toolbar">
        <p>{canDelete ? '관리자' : canEdit ? '편집자' : '열람자'}</p>
        {canEdit && !draft && (
          <button disabled={saving} onClick={() => setDraft({ title: '', body: '' })}>새 게시글</button>
        )}
      </div>
      {actionError && <p role="alert">{actionError}</p>}
      {message && <p role="status">{message}</p>}
      {draft && (
        <form className="panel editor" onSubmit={save}>
          <h2>{draft.id ? '게시글 수정' : '새 게시글'}</h2>
          <fieldset disabled={saving}>
            <label>제목<input required maxLength={120} value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <label>본문<textarea required maxLength={10000} rows={6} value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></label>
            <div className="actions">
              <button type="submit">{saving ? '저장 중…' : '저장'}</button>
              <button className="secondary" type="button" onClick={() => {
                setDraft(undefined)
                setActionError('')
              }}>취소</button>
            </div>
          </fieldset>
        </form>
      )}
      {loading && <p role="status">게시글을 불러오는 중입니다.</p>}
      {listError && (
        <div className="toolbar">
          <p role="alert">게시글을 불러오지 못했습니다.</p>
          <button className="secondary" onClick={() => setVersion((current) => current + 1)}>다시 시도</button>
        </div>
      )}
      {!loading && !listError && items.length === 0 && <p className="panel">게시글이 없습니다.</p>}
      {!loading && !listError && items.map((post) => (
        <article className="panel post" key={post.id}>
          <h2>{post.title}</h2>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('ko-KR')}</time>
          <p>{post.body}</p>
          <div className="actions">
            {canEdit && <button className="secondary" disabled={saving || !!draft}
              onClick={() => {
                setDraft({ id: post.id, title: post.title, body: post.body })
                setActionError('')
              }}>수정</button>}
            {canDelete && <button className="secondary" disabled={saving || !!draft}
              onClick={() => void remove(post)}>삭제</button>}
          </div>
        </article>
      ))}
    </section>
  )
}
