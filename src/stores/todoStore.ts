import { defineStore } from 'pinia'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
import { useEntityHandler } from '@/composables/useEntityHandler'

export interface Entity {
    id: number
    name: string
    value: number
}

const fetchTodos = (
    params: {
        sortField?: string
        sortOrder?: 'asc' | 'desc'
        page?: number
        perPage?: number
    } & Partial<Entity>,
) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
        }
    })

    return fetch(`/api/todos?${searchParams}`).then((res) => res.json())
}

export const useTodoStore = defineStore('todo', () => {
    const { data, setFilters, filters, sort, pagination, getQueryParams } =
        useEntityHandler<Entity>()

    const temporaryFilters = ref({ ...filters.value }) // Lưu giá trị input tạm thời

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

    return {
        todos,
        isLoading,
        data,
        filters,
        sort,
        pagination,
        temporaryFilters,
        handleFilterChange,
    }
})
