import { defineStore } from 'pinia'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { reactive, ref } from 'vue'
import { useEntityHandler } from '@/composables/useEntityHandler'

const fetchTodos = (params: Record<string, unknown>) => {
    const searchParams = new URLSearchParams(params as Record<string, string>)
    return fetch(`/api/todos?${searchParams}`).then((res) => res.json())
}

export interface Entity {
    id: number
    name: string
    value: number
}

export const useTodoStore = defineStore('todo', () => {
    const queryClient = useQueryClient()

    const { data, setData, setFilters, filters, sort, pagination, getQueryParams } =
        useEntityHandler<Entity>()

    const temporaryFilters = ref({ ...filters.value }) // Lưu giá trị input tạm thời

    const params = reactive({
        status: 'active',
        priority: 1,
    })

    const { data: todos, isLoading } = useQuery({
        queryKey: ['todos', getQueryParams],
        queryFn: () => fetchTodos(getQueryParams.value),
        staleTime: 10000, // Dữ liệu sẽ không bị đánh dấu là cũ trong 10 giây
        refetchInterval: 10000, // Tự động refetch sau mỗi 10 giây
        refetchOnWindowFocus: false,
    })

    const handleFilterChange = () => {
        setFilters({ ...temporaryFilters.value }) // Cập nhật filters chính thức
    }

    const addTodoMutation = useMutation({
        mutationFn: (todo: Partial<Entity>) => {
            return fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] })
        },
    })

    return {
        todos,
        params,
        isLoading,
        addTodo: addTodoMutation.mutate,
        data,
        filters,
        sort,
        pagination,
        loadEntities: async () => {
            const mockData: Entity[] = [
                { id: 1, name: 'Entity A', value: 10 },
                { id: 2, name: 'Entity B', value: 20 },
                { id: 3, name: 'Entity C', value: 30 },
            ]
            setData(mockData)
        },
        temporaryFilters,
        handleFilterChange,
    }
})
