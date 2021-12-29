import Head from 'next/head'
import { useCallback, useState } from 'react';
import styles from '../styles/Home.module.css'

const Home = () => {
  const [data, setData] = useState('');
  const handleShowStickers = useCallback(() => {
    (async () => {
      const value = await (await fetch('/api/stickers')).json();
      setData(JSON.stringify(value, null, 2));
    })();
  }, []);
  const handleShowMemos = useCallback(() => {
    (async () => {
      const value = await (await fetch('/api/memos')).json();
      setData(JSON.stringify(value, null, 2));
    })();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Butler Web</title>
        <meta name="description" content="バトラーのクライアントページです" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/ver-1000000/butler/">Butler</a>!
        </h1>

        <aside>
          <button className={styles.card} onClick={handleShowStickers}>Show Stickers</button>
          <button className={styles.card} onClick={handleShowMemos}>Show Memos</button>
        </aside>

        <pre className={styles.output}>
          <output>{data}</output>
        </pre>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/ver-1000000/butler/" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </footer>
    </div>
  )
}
export default Home;
