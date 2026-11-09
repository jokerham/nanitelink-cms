import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import { generateClient } from 'aws-amplify/data'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import type { Schema } from '../amplify/data/resource'
import { Board } from './Board'
import '@aws-amplify/ui-react/styles.css'

type Posts = ReturnType<typeof generateClient<Schema>>['models']['Post']

function Workspace({ posts, signOut }: { posts: Posts; signOut: () => void }) {
  const [groups, setGroups] = useState<string[]>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    fetchAuthSession().then(({ tokens }) => {
      const claims = tokens?.accessToken.payload['cognito:groups']
      if (active) setGroups(Array.isArray(claims) ? claims.filter((group): group is string => typeof group === 'string') : [])
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [])

  const admin = groups?.includes('Admins') ?? false
  const editor = groups?.includes('Editors') ?? false
  const reader = groups?.includes('Readers') ?? false

  return (
    <>
      <div className="toolbar">
        <h1>게시판</h1>
        <button className="secondary" onClick={signOut}>로그아웃</button>
      </div>
      {failed && <p role="alert">권한을 확인하지 못했습니다. 다시 로그인해 주세요.</p>}
      {!failed && !groups && <p role="status">권한 확인 중</p>}
      {groups && !(admin || editor || reader) && <p role="alert">게시판 이용 권한이 없습니다.</p>}
      {(admin || editor || reader) && (
        <Board posts={posts} canEdit={admin || editor} canDelete={admin} />
      )}
    </>
  )
}

export function initializeCms(outputs: unknown) {
  Amplify.configure(outputs as Parameters<typeof Amplify.configure>[0])
  const client = generateClient<Schema>({ authMode: 'userPool' })

  return function ConnectedCms() {
    return (
      <Authenticator hideSignUp loginMechanisms={['email']}>
        {({ signOut, user }) => (
          <Workspace key={user?.userId} posts={client.models.Post} signOut={() => signOut?.()} />
        )}
      </Authenticator>
    )
  }
}
