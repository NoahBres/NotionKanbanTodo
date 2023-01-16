import { ActionPanel, Detail, List, Action, Icon, getPreferenceValues, openExtensionPreferences } from "@raycast/api";
import React, { useEffect, useState } from "react";
import { CreateTodoAction } from "./CreateTodoForm";
import { setNotionKey } from "./notion";
import { Todo, useTodos } from "./useTodos";

export interface Preferences {
  notionToken: string;
  databaseId: string;
}

function PreferenceGuard(props: { children: React.ReactNode }) {
  const preferences = getPreferenceValues<Preferences>();

  if (!preferences.notionToken) {
    return (
      <Detail
        markdown="Please set your Notion token in the Preferences panel."
        actions={
          <ActionPanel>
            <Action title="Open Extension Preferences" onAction={openExtensionPreferences} />
          </ActionPanel>
        }
      />
    );
  }

  useEffect(() => {
    setNotionKey(preferences.notionToken);
  }, [preferences.notionToken]);

  return <>{props.children}</>;
}

export default function Command() {
  const { data: todos, isLoading: todosIsLoading, dispatch: dispatchTodo } = useTodos();
  // const [todos, setTodos] = useState<Todo[]>([]);

  function handleCreate(todo: Todo) {
    // const newTodos = [...todos, todo];
    // setTodos(newTodos);
  }

  function handleToggle(todo: Todo) {
    // const newTodos = [...todos];
    // newTodos[index].isCompleted = !newTodos[index].isCompleted;
    // setTodos(newTodos);
    // mutateTodo(fetch(), { optimisticUpdate(data) {
    //   return data;
    // }}).then().catch();
    dispatchTodo({ action: "toggleTodo", id: todo.id, isCompleted: !todo.isCompleted });
  }

  function handleDelete(index: number) {
    // const newTodos = [...todos];
    // newTodos.splice(index, 1);
    // setTodos(newTodos);
  }

  return (
    <PreferenceGuard>
      <List
        actions={
          <ActionPanel>
            <CreateTodoAction onCreate={handleCreate} />
          </ActionPanel>
        }
        isLoading={!todos || todosIsLoading}
      >
        {(todos ?? []).map((todo) => (
          <List.Item
            key={todo.id}
            title={todo.title}
            icon={todo.isCompleted ? Icon.Checkmark : Icon.Circle}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <ToggleTodoAction todo={todo} onToggle={() => handleToggle(todo)} />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <CreateTodoAction onCreate={handleCreate} />
                  <DeleteTodoAction onDelete={handleDelete} />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
      </List>
    </PreferenceGuard>
  );
}

function ToggleTodoAction(props: { todo: Todo; onToggle: () => void }) {
  return (
    <Action
      icon={props.todo.isCompleted ? Icon.Circle : Icon.Checkmark}
      title={props.todo.isCompleted ? "Uncomplete Todo" : "Complete Todo"}
      onAction={props.onToggle}
    />
  );
}

function DeleteTodoAction(props: { onDelete: (index: number) => void }) {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Todo"
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}
