import { Client } from "@notionhq/client";

let notion: Client | null = null;
let notionToken: string | null = null;
export function setNotionKey(key: string) {
  if (key === notionToken) return;
  notionToken = key;
  notion = new Client({ auth: key });
}

export function getNotion() {
  if (!notion) throw new Error("Notion key not set");

  return notion;
}
