const core = require('@actions/core');
const github = require('@actions/github');
const asana = require('asana');

const ASANA_PAT = core.getInput('asana-pat'),
    SECTION_NAME = core.getInput('target-section'),
    COMMENT_PR_LINK = core.getInput('comment-pr-link'),
    PULL_REQUEST = github.context.payload.pull_request;

async function asanaOperations(ticketId, projectId) {
    const client = asana.Client.create({
        "defaultHeaders": {"asana-enable": "new-sections,string_ids"}
    }).useAccessToken(ASANA_PAT);

    try {
        if(SECTION_NAME) {
            let sections = await client.sections.findByProject(projectId);
            let requiredSection = sections.find(data => data.name === SECTION_NAME);
            if (requiredSection) {
                await client.sections.addTask(section.gid, {task: ticketId});
                console.info('Moved to:', requiredSection.name);
            }
            else{
                console.info('Section not found.')
            }
        }
        if(COMMENT_PR_LINK === 'true') {
            await client.tasks.addComment(ticketId, {
                text: PULL_REQUEST.html_url
            });
            console.log('PR Link Commented on ticket.');
        }
    } catch (ex) {
        console.error(ex.value);
    }
}

try {
    const regex = /\(https:\/\/app.asana.com\/(\d+)\/(\d+)\/(\d+).*?\)/;
    let ticketId = null;
    let projectId = null;
    const parseAsanaURL = regex.exec(PULL_REQUEST.body);
    if (parseAsanaURL != null && parseAsanaURL.length >= 3) {
        ticketId = parseAsanaURL[3];
        projectId = parseAsanaURL[2];
    }
    if (ticketId !== null) {
        asanaOperations(ticketId, projectId)
    }
} catch (error) {
    core.setFailed(error.message);
}
