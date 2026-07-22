import { useEffect, useState } from "react";

export type User = {
  id: number;
  name: string;
};

type Props = {
  searchUsers: (query: string) => Promise<User[]>;
};

export function UserSearch({ searchUsers }: Props) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      searchUsers(query)
        .then((data) => {
          setUsers(data);
        })
        .catch(() => {
          setError("Search failed");
        });

      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, searchUsers]);

  return (
    <div>
      <label htmlFor="user-search">Search users</label>
      <input
        id="user-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {isLoading && <p>Searching...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
