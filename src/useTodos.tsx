import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { type } from "os";

import { Preferences } from ".";
import { getNotion } from "./notion";

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fetchTodos() {
  const { databaseId } = getPreferenceValues<Preferences>();
  const notion = getNotion();

  // Consider date to be 5 hours behind
  // Day starts at 5am
  const date = new Date();
  date.setHours(date.getHours() - 5);
  const day = weekday[date.getDay()];

  return new Promise<Todo[]>((res, rej) => {
    notion.databases
      .query({
        database_id: databaseId,
        filter: {
          property: "Status",
          select: {
            equals: day,
          },
        },
      })
      .then((page) => {
        if (!page.results) {
          res([]);
          return;
        }

        const todos: Todo[] = page.results.map((result) => {
          const hasCheckMark = result?.icon?.emoji === "✅";
          const titlePrependEmoji: string = !hasCheckMark ? result?.icon?.emoji || "" : "";
          const title = `${titlePrependEmoji}${titlePrependEmoji === "" ? "" : " "}${
            result.properties.Name.title[0].plain_text
          }`;

          return {
            id: result.id,
            isCompleted: hasCheckMark,
            title,
          };
        });

        console.log(page.results);
        console.log(todos);
        res(todos);
      })
      .catch((err) => rej(err));
  });
}

type TodoDispatchAction = { action: "toggleTodo"; id: string; isCompleted: boolean };
export function useTodos() {
  const { mutate, ...response } = useCachedPromise(fetchTodos, [], { initialData: [] });

  const dispatch = (action: TodoDispatchAction) => {
    switch (action.action) {
      case "toggleTodo":
        console.log("toggling", action.id);
        mutate(
          getNotion().pages.update({
            page_id: action.id,
            icon: action.isCompleted
              ? {
                  emoji: "✅",
                }
              : null,
          }),
          {
            optimisticUpdate(data: Todo[]) {
              const todo = data.find((todo) => todo.id === action.id);
              if (todo) todo.isCompleted = action.isCompleted;

              return [...data];
            },
          }
        )
          .then()
          .catch();
        break;
    }
  };

  return { ...response, dispatch };
}
