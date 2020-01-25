<script>
  import { print } from 'services/api'
  let test = 'Johnny WUT OK'

  async function loadData() {
    const res = await print()
    test += res
  }

  loadData()
</script>

<h1>HI {test}!</h1> 