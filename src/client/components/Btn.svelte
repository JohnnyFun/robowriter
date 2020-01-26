<script>
	import Icon from 'components/Icon'
  
  export let icon = null
  export { className as class }
  export let disabled = false

  let className = 'primary'
</script>

<button 
  class="btn btn-{className}" 
  type="button" 
  on:click 
  {disabled}>
  <Icon type={icon} />
  <slot />
</button>