<script setup lang="ts">
const { data: profile } = await useProfile();
</script>

<template>
  <div class="signal-field" aria-hidden="true">
    <div class="signal-grid" />
    <div class="signal-orbit signal-orbit-a">
      <span />
    </div>
    <div class="signal-orbit signal-orbit-b">
      <span />
    </div>
    <div class="signal-axis signal-axis-x" />
    <div class="signal-axis signal-axis-y" />
    <p class="signal-coordinate signal-coordinate-a">
      {{ profile?.backgroundCoordinate }}
    </p>
    <p class="signal-coordinate signal-coordinate-b">
      {{ profile?.backgroundTimezone }}
    </p>
  </div>
</template>
