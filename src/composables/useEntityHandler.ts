import { ref, computed, watch } from 'vue'

export interface Pagination {
    page: number
    perPage: number
}

export interface Sort<T> {
    field: keyof T | ''
    order: 'asc' | 'desc'
}

export interface Filter<T> {
    [key: string]: T[keyof T] | undefined
}

export interface EntityHandlerOptions<T> {
    initialData?: T[]
    initialFilters?: Filter<T>
    initialSort?: Sort<T>
    initialPagination?: Pagination
}

export function useEntityHandler<T>(options: EntityHandlerOptions<T> = {}) {
    const {
        initialData = [],
        initialFilters = {},
        initialSort = { field: '', order: 'asc' },
        initialPagination = { page: 1, perPage: 10 },
    } = options

    const data = ref<T[]>(initialData)
    const filters = ref<Filter<T>>(initialFilters)
    const sort = ref<Sort<T>>(initialSort)
    const pagination = ref<Pagination>(initialPagination)

    // Computed filtered and sorted data
    const filteredData = computed(() => {
        return data.value.filter((item) =>
            Object.entries(filters.value).every(
                ([key, value]) =>
                    value == null ||
                    `${(item as Record<keyof T, unknown>)[key as keyof T]}`.includes(`${value}`),
            ),
        )
    })

    const sortedData = computed(() => {
        if (!sort.value.field) return filteredData.value
        return [...filteredData.value].sort((a, b) => {
            const aValue = (a as Record<keyof T, unknown>)[sort.value.field as keyof T]
            const bValue = (b as Record<keyof T, unknown>)[sort.value.field as keyof T]
            const orderMultiplier = sort.value.order === 'asc' ? 1 : -1

            if (aValue == null || bValue == null) return 0
            return aValue > bValue ? orderMultiplier : -orderMultiplier
        })
    })

    const paginatedData = computed(() => {
        const start = (pagination.value.page - 1) * pagination.value.perPage
        const end = start + pagination.value.perPage
        return sortedData.value.slice(start, end)
    })

    // Methods
    const setFilters = (newFilters: Filter<T>) => {
        filters.value = { ...filters.value, ...newFilters }
    }

    const setSort = (newSort: Sort<T>) => {
        sort.value = newSort
    }

    const setPagination = (newPagination: Pagination) => {
        pagination.value = { ...pagination.value, ...newPagination }
    }

    const setData = (newData: T[]) => {
        data.value = newData
    }

    // Watchers to reset pagination on filter/sort change
    watch([filters, sort], () => {
        pagination.value.page = 1
    })

    // Helper function to merge all parameters
    const getQueryParams = computed(() => {
        const query: Record<string, unknown> = {
            ...filters.value,
            sortField: sort.value.field,
            sortOrder: sort.value.order,
            page: pagination.value.page,
            perPage: pagination.value.perPage,
        }

        // Remove undefined or empty values
        return Object.fromEntries(Object.entries(query).filter(([, v]) => v != null && v !== ''))
    })

    return {
        data: paginatedData,
        setData,
        setFilters,
        setSort,
        setPagination,
        filters,
        sort,
        pagination,
        getQueryParams,
    }
}
