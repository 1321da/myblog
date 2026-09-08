import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// react-markdown 默认不渲染原始 HTML、且对链接 URL 做了安全过滤（阻断 javascript: 等），
// 因此天然具备 XSS 防护，无需额外 sanitize。
export default function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
