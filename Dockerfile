FROM continuumio/miniconda3

WORKDIR /app

COPY environment.yml .

RUN conda env remove -n env

RUN conda env create -f environment.yml --force -n env

RUN conda install pip

SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

RUN python3 -m pip install fastapi uvicorn aiohttp async-lru openai hiredis redis tiktoken

COPY . .

# RUN conda activate env

#CMD which python3

CMD ["conda", "run", "--no-capture-output", "-n", "env", "python3", "-u", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

