import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const EditorComponent = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(contentState))
    );
  }, [editorState]);

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleInlineStyle = (inlineStyle) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleHeading = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const blockType = block.getType();
    if (blockType === "header-one") {
      handleChange(RichUtils.toggleBlockType(editorState, "unstyled"));
    } else {
      handleChange(RichUtils.toggleBlockType(editorState, "header-one"));
    }
  };

  const handleBeforeInput = (chars) => {
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const blockWithCursor = currentContent.getBlockForKey(startKey);
    const cursorPosition = selectionState.getStartOffset();
    const textBeforeCursor = blockWithCursor.getText().slice(0, cursorPosition);

    if (chars === "#" && textBeforeCursor.trim() === "") {
      const newContentState = Modifier.insertText(
        currentContent,
        selectionState,
        "#",
        editorState.getCurrentInlineStyle(),
        null
      );
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "insert-characters"
      );
      setEditorState(newEditorState);
      return "handled";
    } else if (chars === "*") {
      if (textBeforeCursor.trim() === "") {
        return "not-handled";
      }
      if (textBeforeCursor.endsWith("** ")) {
        handleChange(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
        return "handled";
      } else if (textBeforeCursor.endsWith("* ")) {
        handleChange(RichUtils.toggleInlineStyle(editorState, "RED"));
        return "handled";
      } else if (textBeforeCursor.endsWith("*")) {
        handleChange(RichUtils.toggleInlineStyle(editorState, "BOLD"));
        return "handled";
      }
    }
    return "not-handled";
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(contentState))
    );
  };

  return (
    <div className="editor-container">
      <div className="title">Draft.js Editor</div>
      <div className="button-container">
        <button onClick={() => handleInlineStyle("BOLD")}>Bold</button>
        <button onClick={() => handleHeading()}>Heading</button>
        <button onClick={saveContent}>Save</button>
      </div>
      <div className="editor">
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
        />
      </div>
    </div>
  );
};

export default EditorComponent;
