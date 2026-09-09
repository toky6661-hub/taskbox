interface User {
    id: number;
    username: string;
    email: string;
}
export declare const useUserStore: import("pinia").SetupStoreDefinition<"user", {
    user: import("vue").Ref<{
        id: number;
        username: string;
        email: string;
    } | null, User | {
        id: number;
        username: string;
        email: string;
    } | null>;
    setUser: (data: User) => void;
    loadUser: () => void;
    logout: () => void;
}>;
export {};
//# sourceMappingURL=user.d.ts.map