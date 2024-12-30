<script lang="ts" setup>
import { useTodoStore } from '@/stores/todoStore'

const todoStore = useTodoStore()
</script>

<template>
    <div>
        <input
            v-model="todoStore.temporaryFilters.status"
            placeholder="Status"
            @change="todoStore.handleFilterChange"
        />
        <input
            type="number"
            v-model="todoStore.temporaryFilters.priority"
            placeholder="Priority"
            @change="todoStore.handleFilterChange"
        />

        <ul>
            <li v-for="todo in todoStore.todos" :key="todo.id">
                {{ todo.name }} - {{ todo.value }}
            </li>
        </ul>
    </div>
</template>
