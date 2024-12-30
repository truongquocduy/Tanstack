import { defineStore } from 'pinia'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
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
