const core = require('@actions/core');
const github = require('@actions/github');
const asana = require('asana');


async function asanaOperations(asanaPAT, projectId, taskId, sectionName, taskComment) {
    const client = asana.Client.create({
        "defaultHeaders": {"asana-enable": "new-sections,string_ids"}
    }).useAccessToken(asanaPAT);

    try {
        if (sectionName) {
            let project = await client.sections.findByProject(projectId);
            if (project) {
                let requiredSection = project.find(data => data.name === sectionName);
                if (requiredSection) {
                    await client.sections.addTask(requiredSection.gid, {task: taskId});
                    core.info('Moved to:', requiredSection.name);
                } else {
                    core.error("Asana section " + sectionName + " not found.")
                }
            } else {
                core.error("Asana project with id " + projectId + " not found.")
            }

        }
        if (taskComment) {
            await client.tasks.addComment(taskId, {
                text: taskComment
            });
            core.info("Added the pull request link to the Asana task.")
        }
    } catch (ex) {
        core.error(ex.value);
    }
}

try {
    const ASANA_PAT = core.getInput('asana-pat'),
        SECTION_NAME = core.getInput('target-section'),
        TRIGGER_PHRASE = core.getInput('trigger-phrase'),
        TASK_COMMENT = core.getInput('task-comment'),
        PULL_REQUEST = github.context.payload.pull_request,
        REGEX = new
        RegExp(`\\*\\*${TRIGGER_PHRASE}:\\*\\* \\[.*?\\]\\(https:\\/\\/app.asana.com\\/(\\d+)\/(\\d+)\\/(\\d+).*?\\)`);
    let taskId = null, projectId = null, taskComment = null;

    const parseAsanaURL = REGEX.exec(PULL_REQUEST.body);
    if (parseAsanaURL != null && parseAsanaURL.length >= 3) {
        projectId = parseAsanaURL[2];
        taskId = parseAsanaURL[3];
    }
    if (TASK_COMMENT) {
        taskComment = `${TASK_COMMENT} ${PULL_REQUEST}`
    }
    if (taskId !== null) {
        asanaOperations(ASANA_PAT, projectId, taskId, SECTION_NAME, taskComment)
    }
} catch (error) {
    core.error(error.message);
}
