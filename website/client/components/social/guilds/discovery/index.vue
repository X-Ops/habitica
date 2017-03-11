<template lang="pug">
.row
  .col-3
    .form-group
      input.form-control(type="text", :placeholder="$t('search')")
    
    form
      h3(v-once) {{ $t('filter') }}

      .form-group
        h5 Interests
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Habitica Official
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Nature
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Animals

  .col-9
    h2(v-once) {{ $t('publicGuilds') }}
    public-guild-item(v-for="guild in guilds", :key='guild._id', :guild="guild")
    mugen-scroll(:handler="fetchGuilds", :should-handle="!loading", :handle-on-mount="true")
      span loading...
</template>

<script>
import MugenScroll from 'vue-mugen-scroll';
import { mapState } from '../../../../store';
import PublicGuildItem from './publicGuildItem';

export default {
  components: { PublicGuildItem, MugenScroll },
  data () {
    return {
      loading: false,
      lastPageLoaded: 0,
      guilds: [],
    };
  },
  computed: {
    ...mapState(['guilds']),
  },
  methods: {
    fetchGuilds () {
      setTimeout(() => {
        this.loading = true;

        /* let res = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map(() => {
          return {
            _id: Date.now(),
            name: Date.now(),
            description: 'aaaa',
            members: Math.random(),
          };
        });
        console.log(res);

        this.guilds.push(...res);
        this.lastPageLoaded++;
        this.loading = false;*/
      }, 250);
    },
  },
};
</script>
