import {
  createAndPopulateGroup,
  translate as t,
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /groups/:groupId/quests/reject', () => {
  let questingGroup;
  let partyMembers;
  let user;
  let leader;

  const PET_QUEST = 'whale';

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 2,
    });

    questingGroup = group;
    leader = groupLeader;
    partyMembers = members;

    await leader.update({
      [`items.quests.${PET_QUEST}`]: 1,
    });
    user = await generateUser();
  });

  context('failure conditions', () => {
    it('returns an error when group is not found', async () => {
      await expect(partyMembers[0].post(`/groups/${generateUUID()}/quests/reject`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('does not accept quest for a group in which user is not a member', async () => {
      await expect(user.post(`/groups/${questingGroup._id}/quests/accept`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });

    it('returns an error when group is a guild', async () => {
      let { group: guild, groupLeader: guildLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'guild', privacy: 'private' },
      });

      await expect(guildLeader.post(`/groups/${guild._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('guildQuestsNotSupported'),
      });
    });

    it('returns an error when group is not on a quest', async () => {
      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('questInvitationDoesNotExist'),
        });
    });

    it('return an error when an user rejects an invite twice', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('questAlreadyRejected'),
      });
    });

    it('return an error when an user rejects an invite already accepted', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('questAlreadyAccepted'),
      });
    });

    it('does not reject invite for a quest already underway', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      // quest will start after everyone has accepted
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/accept`);

      await expect(partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('questAlreadyUnderway'),
      });
    });
  });

  context('successfully quest rejection', () => {
    it('rejects a quest invitation', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/reject`);
      await partyMembers[0].sync();
      await questingGroup.sync();

      expect(partyMembers[0].party.quest.key).to.be.null;
      expect(partyMembers[0].party.quest.RSVPNeeded).to.be.false;
      expect(questingGroup.quest.members[partyMembers[0]._id]).to.be.false;
      expect(questingGroup.quest.active).to.be.false;
    });

    it('starts the quest when the last user reject', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);
      await partyMembers[1].post(`/groups/${questingGroup._id}/quests/reject`);
      await questingGroup.sync();

      expect(questingGroup.quest.active).to.be.true;
    });
  });
});
