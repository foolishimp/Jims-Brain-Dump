import React, { useCallback, useEffect, useRef } from 'react';
import { parseMarkdown } from '../../utils/postit';
import styles from '../../styles/Postit.module.css';
import { Postit } from '../../types';

interface PostitContentProps {
  postit: Postit;
  updatePostit: (updates: Partial<Postit>) => void;
  onStopEditing: () => void;
}

const PostitContent: React.FC<PostitContentProps> = ({ postit, updatePostit, onStopEditing }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updatePostit({ text: event.target.value });
  }, [updatePostit]);

  const handleBlur = useCallback(() => {
    console.log(`Exiting edit mode for Postit ${postit.id}`);
    onStopEditing();
  }, [onStopEditing, postit.id]);

  useEffect(() => {
    if (postit.isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [postit.isEditing]);

  if (postit.isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className={styles.postitTextarea}
        value={postit.text}
        onChange={handleTextChange}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <div
      className={styles.postitContent}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(postit.text) }}
    />
  );
};

export default React.memo(PostitContent);