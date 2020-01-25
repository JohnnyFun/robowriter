<script>
  let test = 'Johnny WUT'

  async function loadData() {
    const res = await fetch('/api/test').then(r => r.text())
    test += res
  }

  loadData()
</script>

<h1>HI {test}!</h1>  yes no